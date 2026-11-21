import { ObjectId, type WithId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  validateServiceInput,
  validateServiceStatus,
} from "@/lib/service-validation";
import {
  SERVICES_COLLECTION,
  type ServiceDocument,
} from "@/lib/services";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function authorizeAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { error: jsonError("You must be signed in.", 401) };
  }

  if (session.user.role !== "admin") {
    return { error: jsonError("Only admins can manage services.", 403) };
  }

  return { session };
}

async function readJsonBody(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return { ok: false as const, error: "Invalid service data." };
    }

    return { ok: true as const, input: body as Record<string, unknown> };
  } catch {
    return { ok: false as const, error: "Invalid JSON body." };
  }
}

function toResponse({ _id, ...service }: WithId<ServiceDocument>) {
  return { id: _id.toString(), ...service };
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/services/[id]">
) {
  const authorized = await authorizeAdmin(request);

  if ("error" in authorized) {
    return authorized.error;
  }

  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return jsonError("Service not found.", 404);
  }

  const parsed = await readJsonBody(request);

  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const keys = Object.keys(parsed.input);
  const isStatusOnlyUpdate = keys.length === 1 && keys[0] === "status";
  const update: Partial<ServiceDocument> = { updatedAt: new Date() };

  if (isStatusOnlyUpdate) {
    const status = validateServiceStatus(parsed.input.status);

    if (!status.ok) {
      return jsonError(status.error, 400);
    }

    update.status = status.status;
  } else {
    const validation = validateServiceInput(parsed.input);

    if (!validation.ok) {
      return jsonError(validation.error, 400);
    }

    Object.assign(update, validation.value);
  }

  try {
    const service = await (await getDb())
      .collection<ServiceDocument>(SERVICES_COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      );

    if (!service) {
      return jsonError("Service not found.", 404);
    }

    return Response.json(toResponse(service));
  } catch (error) {
    console.error("Failed to update service", error);
    return jsonError("Could not update the service.", 500);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/services/[id]">
) {
  const authorized = await authorizeAdmin(request);

  if ("error" in authorized) {
    return authorized.error;
  }

  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return jsonError("Service not found.", 404);
  }

  try {
    const result = await (await getDb())
      .collection<ServiceDocument>(SERVICES_COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return jsonError("Service not found.", 404);
    }

    return Response.json({ id });
  } catch (error) {
    console.error("Failed to delete service", error);
    return jsonError("Could not delete the service.", 500);
  }
}
