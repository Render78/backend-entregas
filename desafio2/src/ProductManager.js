const fs = require('fs').promises;

class ProductManager {

    constructor(filePath) {
        this.products = [];
        this.path = filePath;
    }

    async saveProduct(arrayProducts) {
        try {
            await fs.writeFile(this.path, JSON.stringify(arrayProducts, null, 2))
        } catch (error) {
            console.log('Error al guardar el archivo: ', error)
        }
    }

    async readFile() {
        try {
            const read = await fs.readFile(this.path, 'utf-8')
            const productsArray = JSON.parse(read)
            return productsArray
        } catch (error) {
            console.log('Error al leer el archivo: ', error)
        }
    }

    async addProduct(newProduct) {
        const { title, description, price, thumbnail, code, stock } = newProduct;

        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.log('Complete todos los campos.');
        }

        const validateProduct = this.products.find(p => p.code === code);
        if (validateProduct) {
            console.log('El código del producto ya existe, no se puede repetir el mismo.');
        }

        const product = {
            id: this.products.length + 1,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(product);

        await this.saveProduct(this.products);

        return product;
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf8');

            const products = JSON.parse(data);

            return products;
        } catch (error) {
            console.error('Error al leer el archivo de productos: ', error.message);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const productsArray = await this.readFile()
            const idFound = productsArray.find(prod => prod.id === id)
            if (!idFound) {
                console.error('No se encontro el producto con el id especificado');
                return;
            }

            return idFound;
        } catch (error) {
            console.error('Error en lectura de archivo: ', error);
        }
    }

    async updateProduct(id, productUpdate) {
        try {
            const data = await this.readFile();

            const index = data.findIndex(p => p.id === id);

            if (index !== -1) {
                const updatedProduct = { ...data[index], ...productUpdate };
                data.splice(index, 1, updatedProduct);
                await this.saveProduct(data);
            } else {
                console.error("No se encontro el producto a actualizar");
            }
        } catch (error) {
            console.error("No se pudo actualizar el producto: ", error);
        }
    }

    async deleteProduct(id) {
        try {
            const productsArray = await this.readFile();

            const idFound = productsArray.filter(item => item.id != id);

            await this.saveProduct(idFound);
        } catch (error) {
            console.error("No se pudo borrar el producto: ", error)
        }
    }
}

//TESTING
async function test() {
    const manager = new ProductManager('./desafio2/src/Products.json');
    
    
    const productsBeforeAdd = await manager.getProducts();
    console.log("Productos antes de agregar:", productsBeforeAdd);
    
    
    const product1 = {
        title: 'Producto Prueba1',
        description: 'Este es un Producto de Prueba1',
        price: 200,
        thumbnail: 'Sin Imagen',
        code: 'abc123',
        stock: 25
    };
    await manager.addProduct(product1);

    const product2 = {
        title: 'Producto Prueba2',
        description: 'Este es un Producto de Prueba2',
        price: 300,
        thumbnail: 'Sin Imagen',
        code: 'abc124',
        stock: 35
    };
    await manager.addProduct(product2);
    
    const productsAfterAdd = await manager.getProducts();
    console.log("Productos después de agregar:", productsAfterAdd);

    const productById = await manager.getProductById(2);
    console.log("Producto encontrado por id:", productById);

    // Llamar a updateProduct para modificar un producto
    const productToUpdate = productsAfterAdd[0]; // Tomar el primer producto para actualizar
    const updateData = {
        title: 'Titulo actualizado',
        price: 500,
        stock: 50
        // Puedes agregar más campos si lo deseas
    };
    await manager.updateProduct(productToUpdate.id, updateData);

    // Obtener el producto actualizado
    const updatedProduct = await manager.getProductById(productToUpdate.id);
    console.log("Producto actualizado:", updatedProduct);

    // Si deseas, puedes agregar más pruebas aquí para verificar que la actualización fue exitosa
}

test();