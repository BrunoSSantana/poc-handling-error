import fastify from "fastify";
import { type Either, left, right } from "./either.ts";

const server = fastify({ logger: false });

interface QueryParams {
	fail?: "true" | "false";
}

interface SuccessResponse {
	data: string;
}

type APIError = {
	message: string;
	code: number;
};

// Simula uma query no banco
const simulateDBQuery = async () => {
	return new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 100 + 50),
	); // 50ms - 150ms
};

// Abordagem tradicional com exceções
const fetchDataWithError = async (
	shouldFail: boolean,
): Promise<SuccessResponse> => {
	/* await simulateDBQuery(); */
	if (shouldFail) {
		throw new Error("Erro na API!");
	}
	return { data: "Sucesso!" };
};

// Abordagem usando Either
const fetchDataWithEither = async (
	shouldFail: boolean,
): Promise<Either<APIError, SuccessResponse>> => {
	/* await simulateDBQuery(); */
	if (shouldFail) {
		return left({
			message: "Erro na API!",
			code: 500,
		});
	}
	return right({ data: "Sucesso!" });
};

// Rota que usa try/catch
server.get<{ Querystring: QueryParams }>(
	"/with-error",
	async (request, reply) => {
		try {
			const result = await fetchDataWithError(request.query.fail === "true");
			return result;
		} catch (error) {
			reply.status(500).send({
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
);

// Rota que usa Either
server.get<{ Querystring: QueryParams }>(
	"/with-either",
	async (request, reply) => {
		const result = await fetchDataWithEither(request.query.fail === "true");

		return result
			.ifLeft((error) => {
				reply.status(error.code).send({ error: error.message });
			})
			.ifRight((success) => {
				reply.send(success);
			});
	},
);

// Utilitário para medir performance
const measurePerformance = async (url: string, iterations: number) => {
	const times: number[] = [];

	for (let i = 0; i < iterations; i++) {
		const shouldFail = i % 2 === 0; // Alterna entre sucesso e falha
		const startTime = process.hrtime.bigint();

		try {
			await fetch(`${url}?fail=${shouldFail}`);
		} catch {}

		const endTime = process.hrtime.bigint();
		times.push(Number(endTime - startTime) / 1_000_000); // Converte para ms
	}

	const average = times.reduce((a, b) => a + b, 0) / times.length;
	const min = Math.min(...times);
	const max = Math.max(...times);

	return {
		average,
		min,
		max,
		times,
	};
};

// Função principal para executar os testes
const runPerformanceTest = async (iterations: number) => {
	await server.listen({ port: 3000 });
	console.log("Servidor iniciado na porta 3000");

	console.log("\nTestando rota com tratamento tradicional de erros...");
	const errorResults = await measurePerformance(
		"http://localhost:3000/with-error",
		iterations,
	);

	console.log("\nTestando rota com Either...");
	const eitherResults = await measurePerformance(
		"http://localhost:3000/with-either",
		iterations,
	);

	console.log("\nResultados:\n");
	console.log("Abordagem Tradicional:");
	console.log(`  Média: ${errorResults.average.toFixed(2)}ms`);
	console.log(`  Min: ${errorResults.min.toFixed(2)}ms`);
	console.log(`  Max: ${errorResults.max.toFixed(2)}ms`);

	console.log("\nAbordagem com Either:");
	console.log(`  Média: ${eitherResults.average.toFixed(2)}ms`);
	console.log(`  Min: ${eitherResults.min.toFixed(2)}ms`);
	console.log(`  Max: ${eitherResults.max.toFixed(2)}ms`);

	const performanceDiff =
		((errorResults.average - eitherResults.average) / errorResults.average) *
		100;

	console.log(
		`\nDiferença de performance: ${Math.abs(performanceDiff).toFixed(2)}%`,
	);
	console.log(
		`A abordagem com Either é ${performanceDiff > 0 ? "mais" : "menos"} rápida`,
	);

	await server.close();
	process.exit(0);
};

// Executa o teste
runPerformanceTest(9999).catch(console.error);
