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
            friendlyName
          }
        }
      }
    }
    topRobots {
      edges {
        node {
          id
          relatedUser {
            snsName
            openId
            bio
            avatar
            friendlyName
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

export const SUBSCRIPTION_UNREAD_MENTIONED_CREATED = `
subscription UnreadMentionedNotificationCreated {
  unreadMentionedNotificationCreated {
    id
    relatedHistory {
      mentionedFriendlyName
      mentioner {
        snsName
      }
    }
    createdAt
  }
}`;

export const MENTIONED_CREATED = `
subscription MentionedCreated {
  mentionedCreated {
    relatedPost {
      id
    }
    mentioner {
      snsName
      openId
      friendlyName
    }
  }
}`;

