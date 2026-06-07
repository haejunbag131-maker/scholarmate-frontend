// postcss.config.js
import tailwindcss from "tailwindcss";
import tailwindNesting from "tailwindcss/nesting/index.js";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindNesting, tailwindcss, autoprefixer],
};
