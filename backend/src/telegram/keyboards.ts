import { Markup } from 'telegraf';

/**
 * Interactive Inline Keyboards for Qindil Telegram Bot
 */

export const getMainMenuKeyboard = (isLinked: boolean, isAdmin: boolean = false) => {
  if (isLinked) {
    if (isAdmin) {
      return Markup.inlineKeyboard([
        [
          Markup.button.callback('📊 Admin Status', 'nav_status'),
          Markup.button.callback('📋 My Open Tasks', 'my_tasks'),
        ],
        [
          Markup.button.url('🌐 Open Workspace', 'https://qindilapologetics.com/admin/workspace'),
        ],
        [
          Markup.button.callback('❓ Guide & Help', 'nav_help'),
          Markup.button.callback('📩 Contact Support', 'nav_contact'),
        ],
        [
          Markup.button.callback('🔓 Disconnect Account', 'confirm_unlink'),
        ],
      ]);
    }

    // Standard User / Reader Keyboard
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Reader Status', 'nav_status'),
        Markup.button.url('📚 Reading Library', 'https://qindilapologetics.com/articles'),
      ],
      [
        Markup.button.url('👤 My Profile & Saved', 'https://qindilapologetics.com/dashboard'),
      ],
      [
        Markup.button.callback('❓ Guide & Help', 'nav_help'),
        Markup.button.callback('📩 Contact Support', 'nav_contact'),
      ],
      [
        Markup.button.callback('🔓 Disconnect Account', 'confirm_unlink'),
      ],
    ]);
  }

  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔗 How to Connect', 'how_to_link'),
      Markup.button.url('🌐 Open Platform', 'https://qindilapologetics.com'),
    ],
    [
      Markup.button.callback('❓ Help & Commands', 'nav_help'),
      Markup.button.callback('📩 Contact Team', 'nav_contact'),
    ],
  ]);
};

export const getReaderStatusKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔄 Refresh Status', 'refresh_status'),
      Markup.button.url('📚 Browse Library', 'https://qindilapologetics.com/articles'),
    ],
    [
      Markup.button.url('👤 Personal Dashboard', 'https://qindilapologetics.com/dashboard'),
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
    ],
  ]);
};

export const getStatusKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔄 Refresh Status', 'refresh_status'),
      Markup.button.callback('📋 View My Tasks', 'my_tasks'),
    ],
    [
      Markup.button.url('🌐 Open Workspace', 'https://qindilapologetics.com/admin/workspace'),
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
    ],
  ]);
};

export const getTasksKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔄 Refresh Tasks', 'refresh_tasks'),
      Markup.button.url('🌐 Open Board', 'https://qindilapologetics.com/admin/tasks'),
    ],
    [
      Markup.button.callback('📊 Account Status', 'nav_status'),
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
    ],
  ]);
};

export const getHelpKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 Check Status', 'nav_status'),
      Markup.button.callback('🔗 Link Account', 'how_to_link'),
    ],
    [
      Markup.button.callback('📩 Contact Support', 'nav_contact'),
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
    ],
  ]);
};

export const getContactKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.url('🌐 Public Contact Form', 'https://qindilapologetics.com/contact'),
    ],
    [
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
      Markup.button.callback('❓ Help Guide', 'nav_help'),
    ],
  ]);
};

export const getHowToLinkKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.url('🌐 Log In to Qindil', 'https://qindilapologetics.com/login'),
    ],
    [
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
      Markup.button.callback('📩 Support', 'nav_contact'),
    ],
  ]);
};

export const getUnlinkConfirmKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⚠️ Yes, Disconnect', 'do_unlink'),
      Markup.button.callback('❌ Cancel', 'nav_main'),
    ],
  ]);
};

export const getUnlinkedKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔗 Connect Account', 'how_to_link'),
      Markup.button.callback('🏠 Main Menu', 'nav_main'),
    ],
  ]);
};
