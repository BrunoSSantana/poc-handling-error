import fs from "node:fs";
import os from "node:os";
import autocannon from "autocannon";

const configs = [
	{ connections: 100, duration: 30 },
	{ connections: 200, duration: 30 },
	{ connections: 400, duration: 30 },
	{ connections: 800, duration: 30 },
	{ connections: 1000, duration: 30 },
];

const urls = {
	"Throw Error": "http://localhost:3000/with-error?fail=true",
	"Either Pattern": "http://localhost:3000/with-either?fail=true",
};

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
				latencyAvg: result.latency.average,
				latencyP99: result.latency.p99,
			});
		}
	}

	generateMarkdownReport(results);
}

type Result = {
	connections: number;
	name: string;
	requestsPerSecond: number;
	latencyAvg: number;
	latencyP99: number;
	errors: number;
	timeouts: number;
};

function evaluateBestApproach(results: Result[]): Record<string, Result> {
	const groupedResults = results.reduce((acc, curr) => {
		acc[curr.connections] = acc[curr.connections] || [];
		acc[curr.connections].push(curr);
		return acc;
	}, {});

	const bestResults = {};

	for (const [connections, data] of Object.entries(groupedResults) as [
		string,
		Result[],
	][]) {
		let best: Result | null = null;
		let highestScore = Number.NEGATIVE_INFINITY;

		for (const result of data) {
			let score = 0;

			// Requisições por segundo (peso 3)
			score += result.requestsPerSecond * 3;

			// Latência Média (peso -2, menor é melhor)
			score -= result.latencyAvg * 2;

			// Latência P99 (peso -1, menor é melhor)
			score -= result.latencyP99 * 1;

			// Penalidade para Erros e Timeouts (peso -5 por erro, -10 por timeout)
			score -= result.errors * 5;
			score -= result.timeouts * 10;

			if (score > highestScore) {
				highestScore = score;
				best = result;
			}
		}

		bestResults[connections] = best;
	}

	return bestResults;
}

function getSystemInfo() {
	return {
		sistema: `${os.type()} ${os.release()}`,
		arquitetura: os.arch(),
		cpus: `${os.cpus().length} cores`,
		modeloCPU: os.cpus()[0].model,
		memoriaTotal: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
		memoriaLivre: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
		nodeVersion: process.version,
	};
}

function generateMarkdownReport(results) {
	const sysInfo = getSystemInfo();
	const timestamp = new Date().toLocaleString();

	const bestResults = evaluateBestApproach(results);

	let markdown = `# 📊 Resultados dos Testes de Performance 🚀

**Testes executados usando [Autocannon](https://github.com/mcollina/autocannon)**
Duração por teste: **10s**
Data e hora da execução: **${timestamp}**

## 🔍 **Informações da Máquina**
\`\`\`
Sistema Operacional: ${sysInfo.sistema}
Arquitetura: ${sysInfo.arquitetura}
CPU: ${sysInfo.cpus} (${sysInfo.modeloCPU})
Memória Total: ${sysInfo.memoriaTotal}
Memória Livre: ${sysInfo.memoriaLivre}
Versão do Node.js: ${sysInfo.nodeVersion}
\`\`\`

## **Resultados**
| Conexões | Abordagem | Req/s | Latência Média (ms) | P99 Latência (ms) |
|----------|------------|------|--------------------|----------------|
`;

	for (const res of results) {
		markdown += `| ${res.connections} | ${res.name} | ${res.requestsPerSecond} | ${res.latencyAvg} | ${res.latencyP99} |\n`;
	}

	markdown += "\n## **Melhor Abordagem por Conexões**\n";

	for (const [connections, best] of Object.entries(bestResults)) {
		markdown += `- **Com ${connections} conexões:** 🏆 Melhor: **${best.name}** com **${best.requestsPerSecond} req/s**\n`;
	}

	markdown += "\n🚀 **Testes finalizados!**";

	fs.writeFileSync("RESULTS.md", markdown);
	console.log("\n✅ Relatório gerado: RESULTS.md");
}

runTests();
