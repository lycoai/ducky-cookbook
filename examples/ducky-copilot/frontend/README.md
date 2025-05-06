This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/lycoai/ducky-cookbook.git
cd ducky-cookbook/examples/ducky-copilot/backend
npm install 
# or
yarn install
```

## ⚙️ Env Config

Set the following environment variable in your `.env` file to properly connect the frontend to your backend:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:BACKEND_PORT_VALUE
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# ℹ️ Important Notes

## 🔧 Backend Server

- **Ensure your backend server is running** — the frontend application depends on it for all AI-related operations.

## ⚠️ Port Configuration

- If your **backend uses port `3000`**, make sure to run the **frontend on a different port** to prevent conflicts.
  - Suggested frontend ports: `5173`, `3001`, etc.

## 🔄 Environment Configuration

- Update your **environment variables**, **proxy settings**, or **API URLs** on the frontend side to reference the **correct backend port**.

---

✅ Following these steps ensures smooth communication between the frontend and backend.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
