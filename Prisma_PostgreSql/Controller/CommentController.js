import { response } from "express";
import prisma from "../db/db.config.js";

// get all the data of user

export const getAllComment = async (req, res) => {
  const comments = await prisma.comment.findMany({});

  res.json({ status: 200, comments: comments, message: "All comments" });
};

export const getCommentById = async (req, res) => {
  const id = req.params.id;
  const comment = await prisma.comment.findFirst({ where: { id: id } });

  res.json({ status: 200, comment: comment });
};

//create user
export const createComment = async (req, res) => {
  const { user_id, comment, post_id } = req.body;

  // increase the comment counter
  await prisma.post.update({
    where: {
      id: Number(post_id),
    },
    data : {
        comment_count : {
            increment : 1,
        }
    }
  });
  const newComment = await prisma.comment.create({
    data: {
      user_id: Number(user_id),
      post_id: Number(post_id),
      comment: comment,
    },
  });

  return res.json({ status: 200, message: "comment created." });
};
