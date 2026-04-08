/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/tts",
        destination: `${BACKEND_URL}/tts`,
      },
      {
        source: "/api/tts/:path+",
        destination: `${BACKEND_URL}/tts/:path+`,
      },
      {
        source: "/api/chats",
        destination: `${BACKEND_URL}/chats`,
      },
      {
        source: "/api/chats/:path+",
        destination: `${BACKEND_URL}/chats/:path+`,
      },
    ]
  },
}

export default nextConfig
