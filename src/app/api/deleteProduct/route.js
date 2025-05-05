import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Producto from '../../../models/product';

export async function DELETE(request) {
    await connectDB(); // Ensure MongoDB connection

    try {
        const data = await request.json();
        const id = data.id;

        const deletedProduct = await Producto.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json({
                success: false,
                message: 'Product not found or could not be deleted',
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete product',
            error: error.message,
        });
    }
}
