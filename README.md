# Leadsfy

SaaS para freelancers encontrarem clientes no Reddit.

## Começar

```bash
npm install
cp .env.example .env.local
# Edite .env.local e adicione sua APIFY_API_KEY
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `APIFY_API_KEY` | Token da [Apify Console](https://console.apify.com/account#/integrations) para buscar posts no Reddit |

A busca usa o ator [trudax/reddit-scraper-lite](https://apify.com/trudax/reddit-scraper-lite). No dashboard você escolhe a região:

- **Brasil:** r/brdev, r/empreendedorismo, r/designers, r/freelancers
- **Internacional:** r/forhire, r/hireadev, r/forhiredesign
- **Ambos:** todos os subreddits acima

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Estrutura

```
leadsfy/
├── src/
│   └── app/
│       ├── layout.tsx    # Layout raiz e metadados
│       ├── page.tsx      # Página inicial
│       └── globals.css   # Estilos globais
├── public/               # Arquivos estáticos
└── package.json
```
