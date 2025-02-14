const generateform = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "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";
let isimggenerated = false;

const updateImgCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadbtn = imgCard.querySelector(".download-btn");

        const imgGenerated = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = imgGenerated;

        imgElement.onload = () => {
            imgCard.classList.remove("loading"); 
            updateDownloadButton(downloadbtn, imgGenerated);
        };
    });
};

const updateDownloadButton = (downloadbtn, imgSrc) => {
    fetch(imgSrc)
        .then(res => res.blob())
        .then(blob => {
            const imgURL = URL.createObjectURL(blob);
            downloadbtn.setAttribute("href", imgURL);
            downloadbtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        })
        .catch(error => console.error("Download Error:", error));
};

const enableDownloadForExistingImages = () => {
    document.querySelectorAll(".img-card").forEach(imgCard => {
        const imgElement = imgCard.querySelector("img");
        const downloadbtn = imgCard.querySelector(".download-btn");

        if (imgElement && imgElement.src) {
            updateDownloadButton(downloadbtn, imgElement.src);
        }
    });
};

const generateAiImages = async (userPrompt, userImgQuant) => {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(userImgQuant),
                size: "512x512",
                response_format: "b64_json",
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Expired! ${errorText}`);
        }

        const { data } = await response.json();
        if (data && data.length > 0) {
            updateImgCard([...data]);
        } else {
            throw new Error("No image data returned.");
        }

    } catch (error) {
        console.error("Error details:", error);
        alert(`Error: ${error.message}`);
    } finally {
        isimggenerated = false;
    }
};

const handleFormSubmission = (e) => {
    e.preventDefault();
    if (isimggenerated) return;
    isimggenerated = true;

    const userPrompt = e.target[0].value; 
    const userImgQuant = e.target[1].value;
    const imgCardMarkup = Array.from({ length: userImgQuant }, () =>
        `<div class="img-card loading">
            <img src="image/loader.svg" alt="loading">
            <a href="#" class="download-btn">
                <img src="image/download.png" alt="download icon">
            </a>
        </div>`
    ).join("");

    imageGallery.innerHTML = imgCardMarkup;

    generateAiImages(userPrompt, userImgQuant);
};


document.addEventListener("DOMContentLoaded", enableDownloadForExistingImages);

generateform.addEventListener("submit", handleFormSubmission);
