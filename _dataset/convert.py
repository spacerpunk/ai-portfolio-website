import os
from PIL import Image

def convert_to_png(input_folder, output_folder):
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Loop through all files in the input folder
    for filename in os.listdir(input_folder):
        input_path = os.path.join(input_folder, filename)
        
        # Check if the file is an image
        if os.path.isfile(input_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', 'jfif')):
            try:
                # Open the image
                with Image.open(input_path) as img:
                    # Create output filename
                    output_filename = os.path.splitext(filename)[0] + '.png'
                    output_path = os.path.join(output_folder, output_filename)
                    
                    # Convert and save as PNG
                    img.save(output_path, 'PNG')
                    print(f"Converted: {filename} to PNG")
            except Exception as e:
                print(f"Error converting {filename}: {str(e)}")

# Usage
input_folder = './RAW'
output_folder = './images'
convert_to_png(input_folder, output_folder)