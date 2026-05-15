from app.models.audit_log import AuditLog


def create_log(

    db,

    log_type,

    message
):

    log = AuditLog(

        log_type=log_type,

        message=message
    )

    db.add(log)

    db.commit()