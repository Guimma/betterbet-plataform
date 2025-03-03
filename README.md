# BetterBet Dashboard

Um dashboard para visualização e análise de apostas esportivas, com foco em estatísticas e previsões de resultados.

## Funcionalidades

- Dashboard com visão geral das estatísticas
- Visualização de modelos de previsão
- Listagem de partidas com estatísticas detalhadas
- Previsões de resultados com base em modelos estatísticos
- Detalhes de partidas com gráficos comparativos

## Tecnologias Utilizadas

- React 18
- React Router v6
- Recharts para visualização de dados
- CSS puro para estilização

## Como Executar

1. Clone o repositório
   ```
   git clone https://github.com/Guimma/betterbet-plataform.git
   ```
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o projeto:
   ```
   npm start
   ```
   ou usando o serve:
   ```
   npx serve -s .
   ```
4. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
betterbet-plataform/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── MatchDetail.js
│   │   ├── Matches.js
│   │   ├── Models.js
│   │   └── Predictions.js
│   ├── data/
│   │   ├── matches.js
│   │   ├── models.js
│   │   └── predictions.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   └── reportWebVitals.js
├── package.json
└── README.md
```

## Próximos Passos

- Implementação de backend para dados reais
- Autenticação de usuários
- Mais modelos de previsão
- Filtros avançados para análise de dados
