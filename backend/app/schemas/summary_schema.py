from marshmallow import Schema, fields

class UserSummarySchema(Schema):
    id = fields.Int()
    first_name = fields.Str(data_key="firstName")
    last_name = fields.Str(data_key="lastName")

class TaskSummarySchema(Schema):
    id = fields.Int()
    title = fields.Str()
    assigned_to = fields.Nested(UserSummarySchema, data_key="assignedTo")

class ProjectSummarySchema(Schema):
    id = fields.Int()
    project_name = fields.Str(data_key="projectName")
    project_description = fields.Str(data_key="projectDescription")
    archived = fields.Bool()