import os
import cv2
from deepface import DeepFace

# Define the folder where the images are stored
image_folder = r"C:\Users\giris\Dropbox\Ps_Project\photos\Alice\bea3dacb-56b0-4bb2-8b4f-9bcf8fec70cd"

# Supported image extensions
supported_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif') 
# List all image files in the folder
image_files = [f for f in os.listdir(image_folder) if f.lower().endswith(supported_extensions)]

if not image_files:
    print(f"No images found in folder: {image_folder}")
else:
    for image_file in image_files:
        image_path = os.path.join(image_folder, image_file)
        
        if not os.path.exists(image_path):
            print(f"Error: The file at {image_path} does not exist.")
            continue

        img = cv2.imread(image_path)
        
        if img is None:
            print(f"Error: Unable to load the image at {image_path}.")
            continue
        
        try:
            # Analyze the emotions
            res = DeepFace.analyze(img, actions=['emotion'], detector_backend='opencv')
            
            if isinstance(res, list):
                res = res[0]
            
            emotions = res['emotion']
            print(f"Emotions for {image_path}:")
            
            for emotion, score in emotions.items():
                print(f"{emotion}: {score:.2f}%")
            
            max_emotion = max(emotions, key=emotions.get)
            print(f"The highest emotion is: {max_emotion} with a score of {emotions[max_emotion]:.2f}%\n")
            
        except Exception as e:
            print(f"An error occurred while analyzing {image_path}: {e}")
