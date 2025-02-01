# 📊 Resultados dos Testes de Performance 🚀

**Testes executados usando [Autocannon](https://github.com/mcollina/autocannon)**
Duração por teste: **30s**
Data e hora da execução: **2/1/2025, 7:04:04 PM**

## 🔍 **Informações da Máquina**
```
Sistema Operacional: Linux 5.15.0-130-generic
Arquitetura: x64
CPU: 8 cores (AMD Ryzen 5 3500U with Radeon Vega Mobile Gfx)
Memória Total: 17.44 GB
Memória Livre: 8.76 GB
Versão do Node.js: v23.6.1
```

## **Resultados**
| Conexões | Abordagem | Req/s | Latência Média (ms) | P99 Latência (ms) |
|----------|------------|------|--------------------|----------------|
| 100 | Throw Error | 997.34 | 99.61 | 149 |
| 100 | Either Pattern | 999.07 | 99.45 | 148 |
| 200 | Throw Error | 1982.77 | 100.27 | 149 |
| 200 | Either Pattern | 1992.57 | 99.77 | 149 |
| 400 | Throw Error | 3949.87 | 100.7 | 150 |
| 400 | Either Pattern | 3961.87 | 100.39 | 150 |
| 800 | Throw Error | 7836.4 | 101.58 | 151 |
| 800 | Either Pattern | 7857.07 | 101.32 | 151 |
| 1000 | Throw Error | 9563 | 104.12 | 155 |
| 1000 | Either Pattern | 9738.4 | 102.22 | 152 |

## **Melhor Abordagem por Conexões**
- **Com 100 conexões:** 🏆 Melhor: **Either Pattern** com **999.07 req/s**
- **Com 200 conexões:** 🏆 Melhor: **Either Pattern** com **1992.57 req/s**
- **Com 400 conexões:** 🏆 Melhor: **Either Pattern** com **3961.87 req/s**
- **Com 800 conexões:** 🏆 Melhor: **Either Pattern** com **7857.07 req/s**
- **Com 1000 conexões:** 🏆 Melhor: **Either Pattern** com **9738.4 req/s**

🚀 **Testes finalizados!**