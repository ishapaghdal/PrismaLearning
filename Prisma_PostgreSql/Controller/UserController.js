import { response } from "express";
import prisma from "../db/db.config.js";

// get all the data of user

export const getAllUser = async (req, res) => {
  const users = await prisma.user.findMany({
    select : {
        _count : {
            select : {
                post : true,
                comment : true,
            }
        }
    }
    // include : {
    //     post : {
    //         select : {
    //             title : true,
    //             comment_count : true
    //         }
    //     }
    // }
  });

  res.json({ status: 200, users: users, message: "All users" });
};

export const getUserById = async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findFirst({ where: { id: Number(id) } });

  res.json({ status: 200, user: user });
};

//create user
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const findUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  }); //unique is index so by applying find on that will make it faster to search

  if (findUser) {
    return res.json({ status: 400, message: "Email exist." });
  }

  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: password,
    },
  });

  return res.json({ status: 200, message: "User created." });
};

// update user
export const UpdateUser = async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;

  await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      email,
      password,
    },
  });

  return res.json({ status: 200, message: "User Updated." });
};

//delete user 
