from fastapi import HTTPException, status


def validate_roles(user_roles: list[str], required_roles: list[str]) -> bool:
    """Return True if any of the user's roles intersect with required roles."""
    return bool(set(user_roles) & set(required_roles))


def require_roles(user_roles: list[str], required_roles: list[str]) -> None:
    """Raise 403 if the user does not hold any of the required roles."""
    if not validate_roles(user_roles, required_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for this resource.",
        )
