import { response } from "express";
import prisma from "../db/db.config.js";

// get all the data of user

export const getAllPost = async (req, res) => {
  const posts = await prisma.post.findMany({
    include : {
      comment : true
    }
  });

  res.json({ status: 200, users: posts , message: "All posts" });
};

export const getPostById = async (req, res) => {
  const id = req.params.id;
  const post = await prisma.post.findFirst({ where: { id: Number(id) } });

  res.json({ status: 200, post: post });
};

//create user
export const createPost = async (req, res) => {
  const { user_id, title, description } = req.body;

  const newPost = await prisma.post.create({
    data: {
      user_id: Number(user_id),
      title : title,
      description : description
    },
  });

  return res.json({ status: 200, message: "Post created." });
};
