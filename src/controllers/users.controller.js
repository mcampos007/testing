import { userService } from '../services/service.js';
import UsertDTO from '../services/dto/user.dto.js';
import { createHash, isValidPassword, generateJWToken } from '../utils.js';
import config from '../config/config.js';

//const productService = new ProductService();

export const getAll = async (req, res) => {
  try {
    const { limit, page, query, sort } = req.body;
    let users = await userService.getAll(limit, page, query, sort);
    res.send(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: error, message: 'No se pudo obtener los usuario.' });
  }
};

export const current = async (req, res) => {
  try {
    // console.log(req.params)
    // console.log(req.body)
    let result = await userService.findByUsername(req.user.email);
    let user = new UsertDTO(result);
    res.sendSuccess(user);
  } catch (error) {
    //    console.error(error);
    res
      .status(500)
      .send({ error: error, message: 'No se pudo obtener usuario actual.' });
   // res.sendSuccess(user);
  }
};

export const premiumUserChange = async (req, res) => {
  try {
    //res.sendSuccess(req.user)
    const { uid } = req.params;
    let user = await userService.findById(uid);
    user = new UsertDTO(user);
    if (user.role === 'user' || user.role === 'premium') {
      // Si el valor original de user.role es "user", asignamos "premium" a la nueva variable role
      // Si el valor original de user.role es "premium", asignamos "user" a la nueva variable role
      // if (user.role==="user"){
      //   user.role = "premium"
      // }{
      //   user.role="user"
      // }
      const newRole =
        user.role === 'user'
          ? 'premium'
          : user.role === 'premium'
          ? 'user'
          : user.role;
      
      // Ahora puedes utilizar la variable newRole según sea necesario
      const filter = { _id: uid }; // Filtro para encontrar el documento a actualizar
      const value = { $set: { role: newRole } };
      //console.log(user)
      const result = await userService.update(filter, value);
      res.sendSuccess(result);
    }
     
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({
        error: error,
        message: 'No se pudo actualizar el rol del usuario actual.',
      });
   
  }
};

export const adminUser = async (req, res) => {
  try {
    //res.sendSuccess(req.user)
    const id = '65d12fdfb5e365b718361a83';
    let user = await userService.adminUser(id);
    res.sendSuccess(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: error, message: 'No se pudo obtener usuario actual.' });
    res.sendSuccess(user);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //Validar si es admin
    const userAdmin = config.adminName;
    const passAdmin = config.adminPassword;

    let tokenUser = {};
    let userId = '';

    if (email === userAdmin && password === passAdmin) {
      //Es administrador
      tokenUser = {
        name: `${userAdmin}`,
        email: userAdmin,
        age: 57,
        role: 'admin',
      };
    } else {
      const user = await userService.findByUsername(email);
      if (!user) {
        //console.warn("User doesn't exists with username: " + email);
        return res.status(202).send({
          error: 'Not found',
          message: 'Usuario no encontrado con username: ' + email,
        });
      }

      if (!isValidPassword(user, password)) {
        //console.warn("Invalid credentials for user: " + email);
        return res
          .status(401)
          .send({ status: 'error', error: 'Credenciales inválidas!' });
      }
      // console.log(user)
      tokenUser = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role,
        userId: user._id.toString(),
      };
    }

    const access_token = generateJWToken(tokenUser);
    res.cookie('jwtCookieToken', access_token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true, //No se expone la cookie
      // httpOnly: false //Si se expone la cookie
    });

    res.send({
      message: 'Login successful!',
      access_token: access_token,
      id: userId,
    });
  } catch (error) {
    //console.error(error);
    return res
      .status(500)
      .send({ status: 'error', error: 'Error interno de la applicacion.' });
  }
};

export const register = async (req, res) => {
  try {
    let newUser = new UsertDTO(req.body);
    //console.log(newUser);
    newUser.password = createHash(req.body.password);
    newUser.loggedBy = 'form';
    const userExist = await userService.findByUsername(newUser.email);
    if (userExist) {
      //el usuario ya existe
      res
        .status(400)
        .send({ message: 'El usuario ya existe en la base de datos.' });
    } else {
      const result = await userService.save(newUser);
      res.status(201).send(result);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ error: error, message: 'Error al crear el usuario.' });
  }
};

export const save = async (req, res) => {};

export const findByTitle = async (req, res) => {
  try {
    let { title } = req.params;
    const result = await userService.findById(title);
    if (!result) {
      return res.json({
        error: 'El Usuario No Existe',
      });
    }
    res.json({
      result,
    });
  } catch (error) {
    return error;
  }
};

export const findById = async (req, res) => {
  try {
    let { pid } = req.params;
    const result = await userService.findById(pid);
    if (!result) {
      return res.json({
        error: 'El Usuario No Existe',
      });
    }
    res.json({
      result,
    });
  } catch (error) {
    return error;
  }
};

// //Send Link to password Reset
// export const sendLinkToPasswordReset = async (req, res) => {
//   try {
//     const {email} = req.body
//     if (!email){
//         return res.status(400).send({message:'Email must be provided'})
//     }
//     const token = v4()
//     console.log(token)
//     res.send('send link to password reset');
//   } catch (error) {
//     res
//       .status(500)
//       .send({
//         error: error.message,
//         message: `Could not send email to the next recipient {}`,
//       });
//   }
// };
