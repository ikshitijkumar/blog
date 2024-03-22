const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        return null;
    }
}

const deleteFromCloudinary = async (imageUrl) =>{
    try {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        console.log('Old Image deleted successfully');
      } else {
        console.error('Failed to delete image:', result);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }


module.exports = {uploadOnCloudinary, deleteFromCloudinary}
