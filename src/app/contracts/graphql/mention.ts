export const SUGGESTING_TO_MENTION = `
query SuggestingToMention {
    suggestingToMention {
      asMentioner {
        edges {
          node {
            mentioned {
              snsName
              openId
              bio
              avatar
            }
          }
        }
      }
    }
  }
`;

export const UNREAD_MENTIONED_NOTIFICATION_COUNT = `
query UnreadNotificationCount {
  unreadNotification {
    unreadMentioned {
      totalCount
    }
  }
}
`;