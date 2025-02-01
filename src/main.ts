import fastify from "fastify";

const server = fastify({ logger: false });

interface QueryParams {
	fail?: "true" | "false";
}

const simulateDBQuery = async () => {
	return new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 100 + 50),
	); // 50ms - 150ms
};

// Função que pode falhar
const fetchData = async (shouldFail: boolean) => {
	/* await simulateDBQuery(); */
	if (shouldFail) {
		throw new Error("Erro na API!");
	}
	return { data: "Sucesso!" };
};

// Função que retorna Either (Pattern Functional)
const fetchDataEither = async (shouldFail: boolean) => {
	/* await simulateDBQuery(); */
	if (shouldFail) {
		return { isLeft: true, error: "Erro na API!" };
	}
	return { isLeft: false, value: { data: "Sucesso!" } };
};

// 🛑 API que lança erro
server.get<{ Querystring: QueryParams }>(
	"/with-error",
	async (request, reply) => {
		const result = await fetchData(request.query.fail === "true");
		return result;
	},
);

// ✅ API que usa Either (não lança erro)
server.get<{ Querystring: QueryParams }>(
	"/with-either",
	async (request, reply) => {
		const result = await fetchDataEither(request.query.fail === "true");
		if (result.isLeft) {
			reply.status(500).send({ error: result.error });
		}
		return result.value;
	},
);

// Inicia o servidor
const start = async () => {
	try {
		await server.listen({ port: 3000 });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

await start();
