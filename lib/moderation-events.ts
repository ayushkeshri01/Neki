import { ModerationActionType, Prisma, UserNoticeType } from "@prisma/client";

interface ModerationNoticeInput {
  userId: string;
  noticeType: UserNoticeType;
  title: string;
  body: string;
  payload?: Prisma.InputJsonValue;
  visibleFromLoginAt?: Date;
}

interface RecordModerationEventInput {
  actionType: ModerationActionType;
  actorUserId: string;
  targetUserId?: string | null;
  targetPostId?: string | null;
  reason?: string | null;
  metadata?: Prisma.InputJsonValue;
  idempotencyKey?: string | null;
  notice?: ModerationNoticeInput;
}

export async function recordModerationEvent(
  tx: Prisma.TransactionClient,
  input: RecordModerationEventInput
) {
  const auditData = {
    actionType: input.actionType,
    actorUserId: input.actorUserId,
    targetUserId: input.targetUserId || null,
    targetPostId: input.targetPostId || null,
    reason: input.reason || null,
    metadata: input.metadata,
    idempotencyKey: input.idempotencyKey || null,
  };

  const audit =
    input.idempotencyKey
      ? await tx.moderationAudit.upsert({
          where: {
            actorUserId_idempotencyKey: {
              actorUserId: input.actorUserId,
              idempotencyKey: input.idempotencyKey,
            },
          },
          create: auditData,
          update: {},
        })
      : await tx.moderationAudit.create({
          data: auditData,
        });

  if (input.notice) {
    await tx.userNotice.upsert({
      where: {
        userId_auditId_noticeType: {
          userId: input.notice.userId,
          auditId: audit.id,
          noticeType: input.notice.noticeType,
        },
      },
      create: {
        userId: input.notice.userId,
        noticeType: input.notice.noticeType,
        title: input.notice.title,
        body: input.notice.body,
        payload: input.notice.payload,
        auditId: audit.id,
        visibleFromLoginAt: input.notice.visibleFromLoginAt,
      },
      update: {
        title: input.notice.title,
        body: input.notice.body,
        payload: input.notice.payload,
        visibleFromLoginAt: input.notice.visibleFromLoginAt,
      },
    });
  }

  return audit;
}
