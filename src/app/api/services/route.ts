import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { validateServiceInput } from "@/lib/service-validation";
import { SERVICES_COLLECTION, type ServiceDocument } from "@/lib/services";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const isAdmin = session?.user.role === "admin";

  try {
    const services = await (await getDb())
      .collection<ServiceDocument>(SERVICES_COLLECTION)
      .find(isAdmin ? {} : { status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      services: services.map(({ _id, ...service }) => ({
        id: _id.toString(),
        ...service,
      })),
    });
  } catch (error) {
    console.error("Failed to load services", error);
    return jsonError("Could not load services.", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return jsonError("You must be signed in to create a service.", 401);
  }

  if (session.user.role !== "admin") {
    return jsonError("Only admins can create services.", 403);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError("Invalid service data.", 400);
  }

  const input = body as Record<string, unknown>;
  const validation = validateServiceInput({
    ...input,
    status: input.status ?? "active",
  });

  if (!validation.ok) {
    return jsonError(validation.error, 400);
  }

  const now = new Date();
  const service: ServiceDocument = {
    ...validation.value,
    createdBy: session.user.id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await (await getDb())
      .collection<ServiceDocument>(SERVICES_COLLECTION)
      .insertOne(service);

    return Response.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service", error);
    return jsonError("Could not save the service.", 500);
  }
}
