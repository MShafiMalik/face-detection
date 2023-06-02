import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
const PORT = 4000;
import mysql from "mysql2";

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Database Connection
const DB = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Msh@1931",
  database: "face_detection",
});
DB.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database");
});

app.get("/", (req, res) => {
  DB.query("SELECT * FROM persons", (error, result) => {
    if (error) {
      res
        .status(500)
        .send({ success: false, message: "Internal Server Error!" });
    }

    res.json({
      success: true,
      message: "Data inserted successfully",
      data: result,
    });
  });
});

app.post("/", async (req, res) => {
  const { label, descriptor } = req.body;

  DB.query(
    "INSERT INTO persons SET ?",
    { label, descriptor },
    (error, result) => {
      if (error) {
        console.log(error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error!" });
        return;
      }

      res.json({ success: true, message: "Data inserted successfully" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
