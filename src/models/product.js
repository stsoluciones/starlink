import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    cod_producto: {
        type: String,
        required: true,
        unique: true
    },
    n_producto: {
        type: Number,
        required: false
    },
    marca: {
        type: String,
        required: false
    },
    categoria: {
        type: String,
        required: false
    },
    nombre: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    n_serie: {
        type: String,
        required: false
    },
    titulo_de_producto: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    n_electronica: {
        type: String,
        required: false
    },
    precio: {
        type: String,
        required: true
    },
    destacados: {
        type: Boolean,
        default: false,
        required: false
    },
    usd: {
        type: Boolean,
        default: false,
        required: false
    },
    usado: {
        type: Boolean,
        default: false,
        required: false
    },
    vendido: {
        type: Boolean,
        default: false,
        required: false
    },
    medidas: { 
        type: String, 
        required: false 
    },
    foto_1_1: { 
        type: String, 
        required: false 
    },
    foto_1_2: { 
        type: String, 
        required: false 
    },
    foto_1_3: { 
        type: String, 
        required: false 
    },
    foto_1_4: { 
        type: String, 
        required: false 
    },
    descuento:{
        type: Number,
        required: false,
        default: 0
    },
    hide:{
        type: Boolean,
        default: false,
        required: false
    }
    },
    { 
        timestamps: true
});

const producto = mongoose.models.producto || mongoose.model('producto', productoSchema);

export default producto;
