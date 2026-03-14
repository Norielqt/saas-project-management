import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'
import { BellAlertIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-5 h-5 text-brand-600" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4
            rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black/5
            focus:outline-none z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        if (!notification.read_at) markAsRead(notification.id)
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0
                        transition-colors ${active ? 'bg-gray-50' : ''}
                        ${!notification.read_at ? 'bg-blue-50/50' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                          ${!notification.read_at ? 'bg-brand-500' : 'bg-transparent'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-snug">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

function getNotificationText(notification) {
  const data = notification.data ?? {}
  switch (notification.type) {
    case 'App\\Notifications\\TaskAssigned':
      return `${data.assigned_by ?? 'Someone'} assigned you to "${data.task_title ?? 'a task'}"`
    case 'App\\Notifications\\CommentAdded':
      return `${data.commenter ?? 'Someone'} commented on "${data.task_title ?? 'a task'}"`
    default:
      return data.message ?? 'You have a new notification'
  }
}
