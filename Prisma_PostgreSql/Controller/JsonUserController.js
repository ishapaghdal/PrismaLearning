import { response } from "express";
import prisma from "../db/db.config.js";

export const createJsonUser = async (req, res) => {
  const { name, email, password } = req.body;
  const jsonUser = await prisma.jsonUser.create({
    data: {
      name: "nan",
      profile: [
        {
          name: "abc",
        },
        {
          name: "xyz",
        },
        {
          name: "abc",
        },
      ],
      setting: [
        {
          settingName: "abc",
        },
        {
          settingName: "xyz",
        },
        {
          settingName: "abc",
        },
      ],
    },
    // data : {
    //     name : name,
    //     user : {
    //         name : name,
    //         email : email,
    //         password : password
    //     }
    // }
  });

  console.log(jsonUser);

  res.json({ status: 200, data: jsonUser });
};

export const getAllJsonUser = async (req, res) => {
    const profileNames = await prisma.$queryRaw`
    SELECT jsonb_agg(jsonb_build_object('name', p->>'name')) AS profile_names
    FROM (SELECT jsonb_array_elements(profile) AS p FROM "JsonUser" WHERE id = ${Number(1)}) subquery;
  `;
//   const users = await prisma.jsonUser.findMany({
//     select : {
//         profile :{
//             path : ['name'],
//             equals: 'Claudine',
//         }
//     }
//   });

  res.json({ status: 200, profileNames: profileNames, message: "All json users" });
};
