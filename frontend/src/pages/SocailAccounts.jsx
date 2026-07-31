import React from "react";

const SocialAccounts = () => {
    const connectFacebook = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/v1/social-accounts/facebook/connect";
    };

    const connectInstagram = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/v1/social-accounts/instagram/connect";
    };

    const connectLinkedIn = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/v1/social-accounts/linkedin/connect";
    };

    const connectTwitter = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/v1/social-accounts/twitter/connect";
    };

    const connectYoutube = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/v1/social-accounts/youtube/connect";
    };

    return (
        <div>
            <h1>Social Accounts</h1>

            <button onClick={connectFacebook}>
                Connect Facebook
            </button>

            <button onClick={connectInstagram}>
                Connect Instagram
            </button>

            <button onClick={connectLinkedIn}>
                Connect LinkedIn
            </button>

            <button onClick={connectTwitter}>
                Connect X
            </button>

            <button onClick={connectYoutube}>
                Connect YouTube
            </button>
        </div>
    );
};

export default SocialAccounts;