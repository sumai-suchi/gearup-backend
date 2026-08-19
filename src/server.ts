import app from "./app";
import config from "./config";

const PORT =config.PORT || 5000;

async function main() {
   try {
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
   }
   catch (error) {
       console.error("Error starting server:", error);
   }
}

main()