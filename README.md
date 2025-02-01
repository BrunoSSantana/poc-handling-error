# 📘 **Documentação: Testes de Performance - Throw vs Either🚀**

Bem-vindo ao projeto de **benchmarking** para avaliar a performance de duas abordagens de tratamento de erros, avaliando duas abordagens no Node.js:

- **`throw Error`** (`/with-error`)
- **`Either Pattern`** (`/with-either`)

## 📌 **Objetivo**
Este projeto mede a **performance** das duas abordagens para entender basicamente qual delas:
✅ **Tem melhor throughput (requisições por segundo)**
✅ **Apresenta menor latência (`p99`)**

No final, geramos um **relatório automático (`results.md`)**, que mostra claramente **qual abordagem foi melhor**.

---

## 🛠️ **1. Pré-requisitos**
Antes de executar os testes, você precisará de:
- **Node.js (versão 23.6.1 ou superior)**
- **Git** (para clonar o repositório)

### 📌 **Verifique a versão do Node.js instalado**
Abra um terminal e execute:
```bash
node -v
```
Se o Node.js não estiver instalado, [baixe aqui](https://nodejs.org/) e instale ou use o nvm para instalar a versão desejada.

Se estiver utilizando o nvm, execute:
```bash
nvm install 23.6.1
## ou se já estiver instalado
nvm use 23.6.1
```
O Node.js 23.6.1 será utilizado para executar os testes.

### 📌 **Verifique se possui o git instalado**
Abra um terminal e execute:
```bash
git --version
```
Se o git não estiver instalado, [baixe aqui](https://git-scm.com/) e instale.

---

## 🚀 **2. Como Rodar os Testes**
Agora, siga os passos abaixo:

### **📥 2.1 Clone o repositório**
```bash
git clone https://github.com/brunossantana/poc-handling-error.git
cd poc-handling-error
```

### **📦 2.2 Instale as dependências**
```bash
pnpm install
# ou
npm install
# ou
yarn install
```

### **🖥️ 2.3 Inicie o servidor**
```bash
pnpm start
# ou
npm run start
# ou
yarn start
```
O servidor estará rodando em `http://localhost:3000`.

### **🏎️ 2.4 Execute os testes de carga**
Agora, rode os benchmarks com:
```bash
node ./run-autocannon.ts
```

⏳ O script levará cerca de **30 segundos** para rodar cada a uma das etapas. Case deseje, pode acrescentar mais etapas no arquivo `run-autocannon.ts` na lista `configs` na linha 5.

---

## 📊 **3. Resultados**
Após a execução, um relatório será gerado automaticamente no arquivo **`results.md`**.

### 📌 **Exemplo de saída no terminal**
```bash
🚀 Iniciando benchmark...

🔹 Testando com 100 conexões...
🔸 Rodando teste para: Throw Error
🔸 Rodando teste para: Either Pattern

📊 **Resultados Finais** 📊
✅ Relatório gerado: results.md
```

### 📌 **Abrir o relatório**
Para visualizar os resultados:
```bash
cat RESULTS.md
```

Exemplo de como será o relatório: [RESULTS.md](RESULTS.md)

---

## 📌 **4. Como Interpretar os Resultados**
- **`Req/s` (Requisições por segundo)** → Quanto maior, melhor.
- **`Latência Média (ms)`** → Quanto menor, melhor.
- **`P99 Latência (ms)`** → Indica o tempo máximo para **99% das requisições**. Quanto menor, melhor.
- **`Erros e Timeouts`** → Quanto menor, melhor.

### ✅ **Qual abordagem foi melhor?**
O relatório **destaca automaticamente** a abordagem que teve melhor desempenho em cada nível de conexões.

---

## 🔄 **5. Como Repetir os Testes**
Se quiser rodar os testes novamente:
```bash
node run-autocannon.js
```

---

## 📎 **6. Dúvidas e Contribuições**
Caso tenha dúvidas ou queira melhorar os testes, abra uma **issue** ou envie um **pull request** no [repositório GitHub](https://github.com/seu-usuario/nome-do-repositorio).

---

## 🚀 **Resumo**
1. Clone o repositório
2. Instale as dependências (`pnpm install`)
3. Inicie o servidor (`pnpm start`)
4. Execute os testes (`node run-autocannon.ts`)
5. Veja os resultados no **`RESULTS.md`**

Agora você pode testar e verificar **qual abordagem é mais eficiente** por conta própria ou até se existe! 🚀