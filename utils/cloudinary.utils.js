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
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (imageUrl) =>{
    try {
      // Extract the public ID from the image URL
      // const publicId = cloudinary.utils.publicId(imageUrl);
      const publicId = imageUrl.split('/').pop().split('.')[0];
      // Delete the image by public ID
      const result = await cloudinary.uploader.destroy(publicId);
      //   console.log(result);
  
      // Handle the result - check if the deletion was successful
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
