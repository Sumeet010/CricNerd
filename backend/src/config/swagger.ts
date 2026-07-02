import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cricnerd Backend REST API",
      version: "1.0.0",
      description: "API documentation for Cricket Tournament System",
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], 
};

export const swaggerSpec = swaggerJSDoc(options);