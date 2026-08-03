from pydantic import BaseModel


class FacebookPostRequest(BaseModel):
    page_id: str
    page_access_token: str
    message: str

class FacebookPhotoRequest(BaseModel):
    page_id: str
    page_access_token: str
    image_url: str
    caption: str | None = None    

class FacebookVideoRequest(BaseModel):
    page_id: str
    page_access_token: str
    video_url: str
    description: str    


class FacebookInsightsRequest(BaseModel):
    page_id: str
    page_access_token: str    