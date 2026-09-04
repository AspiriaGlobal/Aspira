import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

console.log("NODE_ENV:", process.env.NODE_ENV);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

