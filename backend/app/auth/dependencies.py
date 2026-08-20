from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.auth.jwt import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


def verify_workspace_access(db: Session, workspace_id: int, user: User):
    """Business owners and active marketing members may scope data to a
    workspace (used by the business/marketing client-scoped pages).
    Raises 403 for everyone else."""
    if user.role == "business":
        allowed = (
            db.query(Workspace)
            .filter(Workspace.id == workspace_id, Workspace.owner_id == user.id)
            .first()
        )
    elif user.role == "marketing":
        allowed = (
            db.query(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .filter(
                Workspace.id == workspace_id,
                WorkspaceMember.user_id == user.id,
                WorkspaceMember.status == "Active",
            )
            .first()
        )
    else:
        allowed = None
    if not allowed:
        raise HTTPException(status_code=403, detail="Workspace access denied.")