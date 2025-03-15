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

## Branding e Identidade Visual

O BetterBet utiliza uma identidade visual moderna e profissional:

### Logos
- **Logo Icon**: `logo_icon.svg` - Ícone principal da marca
- **Logo Name**: `logo_name.svg` - Nome da marca em formato vetorial

### Paleta de Cores
- **Azul Principal**: `#2767e2` - Usado para elementos principais e interativos
- **Azul Escuro**: `#0c2544` - Usado para fundos e elementos secundários
- **Vermelho**: `#ff0000` - Usado como cor de destaque/acento
- **Verde**: `#27ae60` - Usado para indicadores positivos/sucesso
- **Amarelo**: `#f39c12` - Usado para alertas e avisos

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

Este projeto utiliza GitHub Actions para automatizar o deploy no GitHub Pages. O processo funciona da seguinte forma:

1. Todo código fonte é mantido na branch `main`
2. Quando você faz push para a branch `main`, o GitHub Actions é acionado automaticamente
3. O workflow constrói a aplicação e envia os arquivos compilados para a branch `gh-pages`
4. O GitHub Pages serve o conteúdo a partir da branch `gh-pages`

Para atualizar o site, simplesmente:

1. Faça suas alterações na branch `main`
2. Commit e push para o GitHub: `git push origin main`
3. O GitHub Actions fará o resto automaticamente!

**Nota:** Certifique-se de que as configurações do GitHub Pages no repositório estão definidas para usar a branch `gh-pages`.

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



 
 