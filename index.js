import express from "express";
import usuariosRouter from "./routes/usuariosRoutes.js"
import db from "./config/db.js"

const app = express()
app.use(express.static("public"))

// Habilitar Pug
app.set("view engine", "pug")
app.set("views", "./views")

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/", usuariosRouter)

const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})