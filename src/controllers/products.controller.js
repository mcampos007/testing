//import ProductService from "../services/db/products.service.js";
//import { productService } from "../services/factory.js";
import { productService } from "../services/service.js";
import ProductDTO from "../services/dto/product.dto.js";
import { generateProduct } from '../utils.js'
import config from "../config/config.js"

import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/errors-enum.js";
import { generateProductErrorInfo } from "../services/errors/messages/product-creation-error.message.js";

//const productService = new ProductService();

export const getAll = async(req, res) =>{
    try {
        const {limit, page, query, sort} = req.query;

        
        let products = await productService.getAll(limit, page, query, sort);
        res.status(200).send(products);
    } catch (error) {
        // console.error(error);
        res.status(500).send({ error: error, message: "No se pudo obtener los productos." });
    }

}

export const save = async(req, res) =>{
    // try {
        if (req.user.role !== "premium" && req.user.role!=="admin"){
            return res.status(500).send("El usuario no es premium")
        }

        const {title, description, code, price,stock,category, owner} = req.body
        if (!title || !description || !code || !price || !stock || !category) {
            // Creamos un Custom Error
            //console.log("Crear el custom error")
            CustomError.createError({
                name: "Product Create Error",
                //cause: generateProductErrorInfo({ title, description, code, price, stock, category}),
                cause: generateProductErrorInfo(req.body),
                message: "Error tratando de crear al Producto",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }
        if (!owner){
            if (!req.user.email){
                req.body.owner = config.adminName
            }else{
                req.body.owner =req.user.email
            }
        }
        let newProduct = new ProductDTO(req.body);
        let result = await productService.save(newProduct);
        if (result.code === 11000) {
            // Violación de restricción única
            return res.status(409).json({ error: 'Valor duplicado en campo único' });
          } 
        res.status(201).send(result);    
    /* }catch (error) {
        res.status(500).send({ error: error, message: "No se pudo guardar el producto." });
    } */

}

export const findByTitle = async(req, res)=>{
    try {
        let {title} = req.params;
        const result = await productService.findById(title);
        if (!result){
            return res.json({
                error:"El Producto No Existe"
            });
        }
        res.json({
            result
        });    
    } catch (error) {
        return error;
    }

}

export const findById = async(req, res) => {
    try {
        let {pid} = req.params;
        const result = await productService.findById(pid);
        if (!result){
            return res.json({
                error:"El Producto No Existe"
            });
        }
        res.json({
            result
        });    
    } catch (error) {
        return error;
    }

};

export const deleteProduct = async(req, res) =>{
    try{
      //  console.log(req.user)
        let {pid} = req.params;
        if (req.user.role!=="admin"){
            //Verificar que el woner concida con el req.user.email
            let product = await productService.findById(pid)
            if (product.owner !== req.user.email){
                throw new Error("El producto no puede ser eliminado por este usuario")
            }
        }
        const result = await productService.deleteProduct(pid);
        if (!result){
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        return res.status(200).json({ message: 'Producto eliminado correctamente' }); 
    }
    catch (error) {
 //       console.log(error);
 //       res.status(500).send({ error: error, message: "No se pudo Eliminar el producto." });
        res.status(500).send({ error: "No se pudo Eliminar el producto.", message: error.message });
}
};

export const update = async(req, res) =>{
    try {
        const pid = req.params.pid;
       // console.log(req.user)
        if (req.user.role!=="admin"){
            //Verificar que el woner concida con el req.user.email
            let product = await productService.findById(pid)
            if (product.owner !== req.user.email){
                throw new Error("El producto no puede ser modificado por este usuario")
            }
        }
        let newProduct = new ProductDTO(req.body);
        let result = await productService.update(pid,newProduct);
        res.status(201).send(result); 
    } catch (error) {
        res.status(500).send({ error: "No se pudo Actualizar el producto.", message: error.message });
    }
    
}

export const getProducts = async(req, res) =>{
    try {
        let products = [];
        for (let i = 1; i <= 50; i++) {

            // Agregando a la colección
           /*  const prod = generateProduct(i);
            let newProduct = new ProductDTO(prod);
            let result = await productService.save(newProduct);
            products.push(result); */     
            
            //Sin agregar a la colección
             products.push(generateProduct(i));       
        }
        res.send({ status: "success", payload: products });
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo Generar productos." });
    }
}