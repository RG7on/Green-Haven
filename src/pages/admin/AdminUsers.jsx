import { useState, useEffect } from 'react'
import { MdPerson, MdEmail, MdCalendarToday, MdAdminPanelSettings, MdSearch, MdFilterList } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

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
      setFilteredUsers(data.data || [])
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
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Users Management
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} {searchTerm && `(filtered from ${users.length})`}
        </p>
      </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 250px' }}>
              <MdSearch size={20} color="var(--color-muted)" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ flex: 1, margin: 0 }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MdFilterList size={20} color="var(--color-muted)" />
              <span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
                style={{ width: 'auto', minWidth: '120px', margin: 0 }}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)' }}>
              {searchTerm ? 'No users match your search' : 'No users found'}
            </p>
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
                {filteredUsers.map((user) => (
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
    </AdminLayout>
  )
}

export default AdminUsers
