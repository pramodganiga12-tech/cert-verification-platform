import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Search, UserPlus, UploadCloud, Users, ChevronRight, Trash2, ShieldAlert } from 'lucide-react';
import { AdminApiService, StudentRecordUI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { AddStudentModal } from '../components/AddStudentModal';
import { BulkImportStudentsModal } from '../components/BulkImportStudentsModal';
import { StudentProfileDrawerModal } from '../components/StudentProfileDrawerModal';

export const StudentRegistryPage: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentRecordUI[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<StudentRecordUI | null>(null);

  // Delete state
  const [deletingStudent, setDeletingStudent] = useState<StudentRecordUI | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await AdminApiService.listStudents(token);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleDeleteStudent = async () => {
    if (!token || !deletingStudent || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await AdminApiService.deleteStudent(token, deletingStudent.id);
      setIsDeleting(false);
      setDeletingStudent(null);
      if (selectedStudentForDrawer?.id === deletingStudent.id) {
        setSelectedStudentForDrawer(null);
      }
      fetchStudents();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to remove student');
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter((stu) => {
    const fullName = `${stu.first_name} ${stu.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      stu.student_identifier.toLowerCase().includes(query) ||
      stu.email.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout activeTab="students">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">Student Directory</h1>
            <p className="text-xs text-slate-400">Click any student roll number to view profile, issue certificates, attach PDFs, or remove student roll IDs.</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>CSV Bulk Import</span>
            </button>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          </div>
        </div>

        {/* Search Control */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, roll number, or email..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Student Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Roll / ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Date of Birth</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No student records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr
                      key={stu.id}
                      onClick={() => setSelectedStudentForDrawer(stu)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-sky-300 font-bold group-hover:text-sky-200 transition-colors">
                        {stu.student_identifier}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-100 font-medium group-hover:text-white transition-colors">
                        {stu.first_name} {stu.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">{stu.email}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">{stu.dob || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">{new Date(stu.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForDrawer(stu);
                          }}
                          className="px-2.5 py-1 bg-slate-800 group-hover:bg-sky-500/20 text-slate-300 group-hover:text-sky-300 text-[11px] font-sans font-semibold rounded-lg border border-slate-700/80 transition-all inline-flex items-center space-x-1"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingStudent(stu);
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/20 transition-all inline-flex items-center"
                          title="Remove Student Roll ID"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remove Student Confirmation Modal */}
        {deletingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center font-sans">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl inline-block text-rose-400">
                <ShieldAlert className="w-8 h-8 mx-auto" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">Remove Student Roll ID</h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to remove <strong className="text-slate-200">{deletingStudent.first_name} {deletingStudent.last_name}</strong> (<span className="font-mono text-sky-400">{deletingStudent.student_identifier}</span>)?
                </p>
              </div>

              {deleteError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingStudent(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudent}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Removing...' : 'Confirm Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          onSuccess={fetchStudents}
        />

        <BulkImportStudentsModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onSuccess={fetchStudents}
        />

        {/* Student Detailed Drawer & Document Upload Modal */}
        <StudentProfileDrawerModal
          student={selectedStudentForDrawer}
          isOpen={!!selectedStudentForDrawer}
          onClose={() => setSelectedStudentForDrawer(null)}
          onUpdate={fetchStudents}
          onDeleteRequest={(stu) => setDeletingStudent(stu)}
        />
      </div>
    </DashboardLayout>
  );
};
