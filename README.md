# BetterBet Dashboard

Um dashboard para visualização e análise de apostas esportivas, com foco em estatísticas e previsões de resultados.

## Demo Online

Acesse a versão online do projeto: [BetterBet Dashboard](https://guimma.github.io/betterbet-plataform/)

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
- GitHub Pages para hospedagem

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
4. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

## Deploy para o GitHub Pages

Este projeto está configurado para ser servido diretamente da branch main do GitHub Pages. Para atualizar o site:

1. Faça suas alterações na branch main
2. Execute o build do projeto:
   ```
   npm run build
   ```
3. Copie o conteúdo da pasta build para a raiz do projeto 
4. Faça commit e push das alterações para a branch main
5. O GitHub Pages irá servir o conteúdo automaticamente da branch main

Certifique-se de que as configurações do GitHub Pages no repositório estão definidas para usar a branch main.

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
