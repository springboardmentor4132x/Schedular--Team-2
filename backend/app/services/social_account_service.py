from sqlalchemy.orm import Session

from app.models.social_account import SocialAccount


def create_account(db: Session, account_data):
    account = SocialAccount(**account_data)

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


def get_accounts(db: Session):
    return db.query(SocialAccount).all()


def delete_account(db: Session, account_id: int):
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id
    ).first()

    if account:
        db.delete(account)
        db.commit()

    return account