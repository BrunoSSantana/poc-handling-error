import autocannon from "autocannon";

// Configuração dos testes
const configs = [
	{ connections: 100, duration: 10 },
	{ connections: 200, duration: 10 },
	{ connections: 400, duration: 10 },
];

// URLs para testar
const urls = {
	"Throw Error": "http://localhost:3000/with-error?fail=true",
	"Either Pattern": "http://localhost:3000/with-either?fail=true",
};

// Função para rodar os testes
async function runTests() {
	console.log("🚀 Iniciando benchmark...");

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const results: any[] = [];

	for (const config of configs) {
		console.log(`\n🔹 Testando com ${config.connections} conexões...\n`);

		for (const [name, url] of Object.entries(urls)) {
			console.log(`🔸 Rodando teste para: ${name}`);

			const result = await autocannon({
				url,
				connections: config.connections,
				duration: config.duration,
			});

			results.push({
				name,
				connections: config.connections,
				requestsPerSecond: result.requests.average,
				latency: result.latency.average,
				errors: result.errors,
				timeouts: result.timeouts,
			});
		}
	}

	// Exibir resultados finais formatados
	console.log("\n📊 **Resultados Finais** 📊\n");

	for (const res of results) {
		console.log(
			`🔹 ${res.name} | Conexões: ${res.connections} | ` +
				`Req/s: ${res.requestsPerSecond} | Latência: ${res.latency} ms | ` +
				`Erros: ${res.errors} | Timeouts: ${res.timeouts}`,
		);
	}

	// Identificar qual abordagem foi melhor
	console.log("\n✅ **Resumo Final:**");
	const groupedResults = results.reduce((acc, curr) => {
		acc[curr.connections] = acc[curr.connections] || [];
		acc[curr.connections].push(curr);
		return acc;
	}, {});

	// biome-ignore lint/complexity/noForEach: <explanation>
	Object.entries(groupedResults).forEach(([connections, data]) => {
		console.log(`\n🔹 Com ${connections} conexões:`);
		// @ts-ignore
		const best = data.reduce((best, curr) =>
			curr.requestsPerSecond > best.requestsPerSecond ? curr : best,
		);
		console.log(`🏆 Melhor: ${best.name} com ${best.requestsPerSecond} req/s`);
	});

	console.log("\n🚀 Testes finalizados!");
}

// Rodar os testes
runTests();
