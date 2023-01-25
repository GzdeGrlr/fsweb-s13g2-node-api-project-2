// post routerları buraya yazın
const express = require("express");

const PostModel = require("./posts-model");

const router = express.Router();

router.use(express.json());

router.get("/", (req, res) => {
  PostModel.find()
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json({ message: "Gönderiler alınamadı" });
    });
});

router.get("/:id", (req, res) => {
  PostModel.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res
          .status(404)
          .json({ message: "Belirtilen ID'li gönderi bulunamadı" });
      }
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ message: "Gönderi bilgisi alınamadı" });
    });
});

router.post("/", (req, res) => {
  const post = req.body;

  if (!post.title || !post.contents) {
    res
      .status(400)
      .json({ message: "Lütfen gönderi için bir title ve contents sağlayın" });
  } else {
    PostModel.insert(post)
      .then(({ id }) => {
        return PostModel.findById(id);
      })
      .then((createdPost) => {
        res.status(201).json(createdPost);
      })
      .catch((err) => {
        res
          .status(500)
          .json({ message: "Veritabanına kaydedilirken bir hata oluştu" });
      });
  }
});

router.put("/:id", async (req, res) => {
  const post = req.body;
  try {
    const relatedPost = await PostModel.findById(req.params.id);
    if (!relatedPost) {
      res.status(404).json({ message: "Belirtilen ID'li gönderi bulunamadı" });
    } else {
      if (!post.title || !post.contents) {
        res
          .status(400)
          .json({ message: "Lütfen gönderi için title ve contents sağlayın" });
      } else {
        const updatedPost = await PostModel.update(req.params.id, post).then(
          (id) => {
            return PostModel.findById(id);
          }
        );
        res.status(200).json(updatedPost);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Gönderi bilgileri güncellenemedi" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const relatedPost = await PostModel.findById(req.params.id);
    if (!relatedPost) {
      res.status(404).json({ message: "Belirtilen ID li gönderi bulunamadı" });
    } else {
      await PostModel.remove(req.params.id);
      res.status(200).json(relatedPost);
    }
  } catch (err) {
    res.status(500).json({ message: "Gönderi silinemedi" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const relatedPost = await PostModel.findCommentById(req.params.id);
    if (!relatedPost) {
      res.status(404).json({ message: "Girilen ID'li gönderi bulunamadı." });
    } else {
      await PostModel.findPostComments(req.params.id).then((post) => {
        res.json(post);
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Yorumlar bilgisi getirilemedi" });
  }
});

module.exports = router;
