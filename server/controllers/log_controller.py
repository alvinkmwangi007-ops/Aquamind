from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models.water_log import WaterLog
from schemas.water_log_schema import WaterLogSchema

log_bp = Blueprint("log_bp", __name__)
log_schema = WaterLogSchema()
logs_schema = WaterLogSchema(many=True)


def pagination_metadata(results, page, per_page):
    return {
        "total": results.total,
        "page": results.page,
        "per_page": results.per_page,
        "total_pages": results.pages,
    }


@log_bp.route("/", methods=["GET"])
@jwt_required()
def get_logs():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    identity = get_jwt_identity()

    query = WaterLog.query.filter_by(user_id=identity["id"]).order_by(WaterLog.logged_at.desc())
    logs = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "data": logs_schema.dump(logs.items),
        **pagination_metadata(logs, page, per_page),
    })


@log_bp.route("/summary", methods=["GET"])
@jwt_required()
def logs_summary():
    identity = get_jwt_identity()
    summary = (
        db.session.query(func.date(WaterLog.logged_at).label("date"), func.sum(WaterLog.amount_ml).label("total_ml"))
        .filter(WaterLog.user_id == identity["id"])
        .group_by(func.date(WaterLog.logged_at))
        .order_by(func.date(WaterLog.logged_at).desc())
        .all()
    )
    return jsonify([{"date": row.date, "total_ml": row.total_ml} for row in summary])


@log_bp.route("/", methods=["POST"])
@jwt_required()
def create_log():
    data = request.get_json()
    identity = get_jwt_identity()
    log = WaterLog(user_id=identity["id"], amount_ml=data["amount_ml"])
    db.session.add(log)
    db.session.commit()
    return jsonify(log_schema.dump(log)), 201


@log_bp.route("/<int:log_id>", methods=["PUT"])
@jwt_required()
def update_log(log_id):
    data = request.get_json()
    identity = get_jwt_identity()
    log = WaterLog.query.filter_by(id=log_id, user_id=identity["id"]).first_or_404()
    log.amount_ml = data.get("amount_ml", log.amount_ml)
    db.session.commit()
    return jsonify(log_schema.dump(log))


@log_bp.route("/<int:log_id>", methods=["DELETE"])
@jwt_required()
def delete_log(log_id):
    identity = get_jwt_identity()
    log = WaterLog.query.filter_by(id=log_id, user_id=identity["id"]).first_or_404()
    db.session.delete(log)
    db.session.commit()
    return jsonify({"message": "Deleted"})
