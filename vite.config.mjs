import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
};
// server: {
//   proxy: {
//     "/api/Event/GetAll" {
//       target: "http://localhost:7108",
//       changeOrigin = true,
//       secure = false
//     }
//   }
// }
