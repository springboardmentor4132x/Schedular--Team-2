from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from app.services.facebook_service import (
    get_facebook_login_url,
    exchange_code_for_access_token,
)

from app.services.linkedin_service import (
    get_linkedin_login_url,
    exchange_code_for_access_token as exchange_linkedin_token,
)

router = APIRouter(
    prefix="/social-accounts",
    tags=["Social Accounts"]
)


# ===========================
# Facebook OAuth
# ===========================

@router.get("/facebook/connect")
def connect_facebook():
    """
    Redirect user to Facebook Login.
    """
    url = get_facebook_login_url()
    return RedirectResponse(url=url)


@router.get("/facebook/callback")
def facebook_callback(code: str):
    """
    Facebook redirects here after login.
    Exchange authorization code for access token.
    """
    try:
        token_data = exchange_code_for_access_token(code)

        return {
            "message": "Facebook connected successfully",
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "expires_in": token_data["expires_in"]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ===========================
# Linkedin OAuth
# ===========================    

@router.get("/linkedin/connect")
def connect_linkedin():
    url = get_linkedin_login_url()
    return RedirectResponse(url=url)


@router.get("/linkedin/callback")
def linkedin_callback(code: str):
    try:
        token_data = exchange_linkedin_token(code)

        return {
            "message": "LinkedIn connected successfully",
            "access_token": token_data["access_token"],
            "expires_in": token_data.get("expires_in"),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# ===========================
# Other Social Account APIs
# ===========================

@router.post("/connect")
def connect_social_account():
    return {
        "message": "Connect Social Account - Pending Implementation"
    }


@router.get("/")
def get_connected_accounts():
    return {
        "message": "Get Connected Social Accounts - Pending Implementation"
    }


@router.get("/{account_id}")
def get_connected_account(account_id: int):
    return {
        "message": f"Get Social Account {account_id} - Pending Implementation"
    }


@router.put("/{account_id}")
def update_connected_account(account_id: int):
    return {
        "message": f"Update Social Account {account_id} - Pending Implementation"
    }


@router.delete("/{account_id}")
def disconnect_social_account(account_id: int):
    return {
        "message": f"Disconnect Social Account {account_id} - Pending Implementation"
    }