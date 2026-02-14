import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /api/articles/latest - Get the 3 latest articles
router.get("/latest", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, content, image_url, category, author, created_at FROM articles ORDER BY created_at DESC LIMIT 3"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

// GET /api/articles/:id - Get a single article by ID
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, title, content, image_url, category, author, created_at FROM articles WHERE id = ?",
      [id]
    );
    const article = (rows as any[])[0];
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: "Article not found" });
    }
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    res.status(500).json({ message: "Failed to fetch article" });
  }
});

// POST /api/articles - Create a new article (Admin protected)
router.post("/", async (req: Request, res: Response) => {
  // NOTE: Authentication check will be added in index.ts middleware
  const { title, content, image_url, category, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: "Title, content, and author are required" });
  }

  // Validate category
  const validCategories = ["student", "teacher"];
  const categoryValue = category && validCategories.includes(category) ? category : "student";

  try {
    const [result] = await pool.query(
      "INSERT INTO articles (title, content, image_url, category, author) VALUES (?, ?, ?, ?, ?)",
      [title, content, image_url || null, categoryValue, author]
    );
    res.status(201).json({
      id: (result as any).insertId,
      title,
      content,
      image_url,
      category: categoryValue,
      author,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Failed to create article" });
  }
});

export default router;
