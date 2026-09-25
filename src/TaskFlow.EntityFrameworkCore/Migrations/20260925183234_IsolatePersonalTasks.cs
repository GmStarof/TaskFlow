using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Migrations
{
    /// <inheritdoc />
    public partial class IsolatePersonalTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Books",
                table: "Books");

            migrationBuilder.RenameTable(
                name: "Books",
                newName: "Tarefas");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Tarefas",
                type: "uniqueidentifier",
                nullable: true);

            // Preserve the organization of existing tasks when their author is known.
            // Rows with no author remain unassigned and are never exposed by the API.
            migrationBuilder.Sql(@"
                UPDATE tarefa SET TenantId = usuario.TenantId
                FROM Tarefas AS tarefa
                INNER JOIN AbpUsers AS usuario ON usuario.Id = tarefa.CreatorId;");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tarefas",
                table: "Tarefas",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Tarefas_TenantId_CreatorId",
                table: "Tarefas",
                columns: new[] { "TenantId", "CreatorId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Tarefas",
                table: "Tarefas");

            migrationBuilder.DropIndex(
                name: "IX_Tarefas_TenantId_CreatorId",
                table: "Tarefas");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Tarefas");

            migrationBuilder.RenameTable(
                name: "Tarefas",
                newName: "Books");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Books",
                table: "Books",
                column: "Id");
        }
    }
}
