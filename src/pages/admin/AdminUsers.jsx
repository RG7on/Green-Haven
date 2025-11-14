import { useState, useEffect } from 'react'
import { MdPerson, MdEmail, MdCalendarToday, MdAdminPanelSettings } from 'react-icons/md'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch('/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUsers(data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      const data = await res.json()
      if (res.ok) {
        fetchUsers()
      } else {
        alert(data.message || 'Failed to update role')
      }
    } catch (error) {
      console.error('Failed to update role:', error)
      alert('Failed to update user role')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Users Management
          </h1>
          <p style={{ color: 'var(--color-muted)' }}>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Users List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)' }}>No users found</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--color-text)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600'
                          }}
                        >
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--color-text)' }}>
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MdEmail size={16} color="var(--color-muted)" />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MdCalendarToday size={16} color="var(--color-muted)" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: user.role === 'admin' ? '#FF980020' : '#2196F320',
                          color: user.role === 'admin' ? '#FF9800' : '#2196F3'
                        }}
                      >
                        {user.role === 'admin' && <MdAdminPanelSettings size={16} />}
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <select
                        value={user.role}
                        onChange={(e) => {
                          if (window.confirm(`Change ${user.firstName} ${user.lastName}'s role to ${e.target.value}?`)) {
                            handleRoleChange(user._id, e.target.value)
                          } else {
                            e.target.value = user.role
                          }
                        }}
                        className="input"
                        style={{ width: 'auto', minWidth: '120px' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
