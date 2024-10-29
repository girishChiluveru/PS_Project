import os
import cv2
from flask import Flask, jsonify
from deepface import DeepFace

app = Flask(__name__)

IMAGE_FOLDER = r"C:\Users\giris\Dropbox\Ps_Project\photos"
SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')

@app.route('/analyze_emotions', methods=['GET'])
def analyze_emotions():
    image_files = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(SUPPORTED_EXTENSIONS)]
    results = []

    if not image_files:
        return jsonify({"error": f"No images found in folder: {IMAGE_FOLDER}"}), 404

    for image_file in image_files:
        image_path = os.path.join(IMAGE_FOLDER, image_file)

        if not os.path.exists(image_path):
            results.append({"file": image_file, "error": f"The file at {image_path} does not exist."})
            continue

        img = cv2.imread(image_path)

        if img is None:
            results.append({"file": image_file, "error": f"Unable to load the image at {image_path}."})
            continue

        try:
            # Analyze emotions using DeepFace
            res = DeepFace.analyze(img, actions=['emotion'], detector_backend='opencv')
            if isinstance(res, list):
                res = res[0]

            emotions = res['emotion']
            max_emotion = max(emotions, key=emotions.get)

            results.append({
                "file": image_file,
                "emotions": {emotion: f"{score:.2f}%" for emotion, score in emotions.items()},
                "dominant_emotion": max_emotion,
                "dominant_score": f"{emotions[max_emotion]:.2f}%"
            })
        except Exception as e:
            results.append({"file": image_file, "error": str(e)})

    return jsonify(results)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
